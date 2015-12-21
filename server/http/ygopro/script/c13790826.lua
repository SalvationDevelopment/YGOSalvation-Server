--Moon-Light Cat Dancer
function c13790826.initial_effect(c)
	--fusion material
	c:EnableReviveLimit()
	aux.AddFusionProcFunRep(c,aux.FilterBoolFunction(Card.IsSetCard,0x209),2,true)
	--battle indestructable
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e1:SetValue(1)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetCategory(CATEGORY_DAMAGE)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCountLimit(1)
	e2:SetCondition(c13790826.condition)
	e2:SetCost(c13790826.cost)
	e2:SetOperation(c13790826.operation)
	c:RegisterEffect(e2)
	--damage
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e3:SetCode(EVENT_ATTACK_ANNOUNCE)
	e3:SetTarget(c13790826.damtg)
	e3:SetOperation(c13790826.damop)
	c:RegisterEffect(e3)

end
function c13790826.damtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetTargetPlayer(1-tp)
	Duel.SetTargetParam(100)
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,1-tp,100)
end
function c13790826.damop(e,tp,eg,ep,ev,re,r,rp)
	local p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	Duel.Damage(p,d,REASON_EFFECT)
end

function c13790826.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetCurrentPhase()==PHASE_MAIN1
end
function c13790826.costfilter(c)
	return c:IsSetCard(0x209)
end
function c13790826.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckReleaseGroup(tp,c13790826.costfilter,1,nil) end
	local g=Duel.SelectReleaseGroup(tp,c13790826.costfilter,1,1,nil)
	Duel.Release(g,REASON_COST)
end

function c13790826.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_EXTRA_ATTACK)
	e1:SetValue(50)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
	e1:SetReset(RESET_EVENT+0x1fe1000+RESET_PHASE+RESET_END)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EFFECT_DESTROY_REPLACE)
	e2:SetTarget(c13790826.reptg)
	e2:SetValue(c13790826.repval)
	e2:SetReset(RESET_EVENT+0x1fe1000+RESET_PHASE+RESET_END)
	Duel.RegisterEffect(e2,tp)
	local g=Group.CreateGroup()
	g:KeepAlive()
	e2:SetLabelObject(g)
end
function c13790826.repfilter(c,tp)
	return c:IsControler(1-tp) and c:IsOnField() and c:IsReason(REASON_BATTLE) and c:GetFlagEffect(13790826)==0
end
function c13790826.reptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return eg:IsExists(c13790826.repfilter,1,nil,tp) end
	local g=eg:Filter(c13790826.repfilter,nil,tp)
	local tc=g:GetFirst()
	while tc do
		tc:RegisterFlagEffect(13790826,RESET_EVENT+0x1fc0000+RESET_PHASE+RESET_END,EFFECT_FLAG_CLIENT_HINT,1,0,aux.Stringid(13790826,0))
		tc=g:GetNext()
	end
	e:GetLabelObject():Clear()
	e:GetLabelObject():Merge(g)
	return true
end
function c13790826.repval(e,c)
	local g=e:GetLabelObject()
	return g:IsContains(c)
end

