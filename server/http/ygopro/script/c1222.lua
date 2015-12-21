--サイコ·リアクター
function c1222.initial_effect(c)
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c1222.regcon)
	e1:SetOperation(c1222.regop)
	c:RegisterEffect(e1)
end
function c1222.cfilter(c)
	return c:IsFaceup()
end
function c1222.regcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c1222.cfilter,tp,LOCATION_MZONE,0,1,nil)
end
function c1222.regop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c1222.cfilter,tp,LOCATION_MZONE,0,nil)
	local tc=g:GetFirst()
	while tc do
		tc:RegisterFlagEffect(1222,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
		tc=g:GetNext()
	end
	g:KeepAlive()
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetDescription(aux.Stringid(1222,0))
	e1:SetCategory(CATEGORY_REMOVE)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e1:SetCode(EVENT_BATTLED)
	e1:SetTarget(c1222.target)
	e1:SetOperation(c1222.operation)
	e1:SetReset(RESET_PHASE+PHASE_END)
	e1:SetLabelObject(g)
	Duel.RegisterEffect(e1,tp)
	local e2=Effect.CreateEffect(e:GetHandler())
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EVENT_PHASE_START+PHASE_END)
	e2:SetReset(RESET_PHASE+PHASE_END)
	e2:SetCountLimit(1)
	e2:SetLabelObject(g)
	e2:SetOperation(c1222.reset)
	Duel.RegisterEffect(e2,tp)
end
function c1222.filter(c,g)
	return c:GetFlagEffect(1222)>0 and g:IsContains(c)
end
function c1222.target(e,tp,eg,ep,ev,re,r,rp,chk)
	local a=Duel.GetAttacker()
	local d=Duel.GetAttackTarget()
	local g=Group.FromCards(a,d)
	if chk==0 then return d and g:IsExists(c1222.filter,1,nil,e:GetLabelObject()) end
	local rg=g:Filter(Card.IsRelateToBattle,nil)
	Duel.SetOperationInfo(0,CATEGORY_REMOVE,rg,rg:GetCount(),0,0)
end
function c1222.operation(e,tp,eg,ep,ev,re,r,rp)
	local a=Duel.GetAttacker()
	local d=Duel.GetAttackTarget()
	local g=Group.FromCards(a,d)
	local rg=g:Filter(Card.IsRelateToBattle,nil)
	Duel.Remove(rg,POS_FACEUP,REASON_EFFECT)
end
function c1222.reset(e,tp,eg,ep,ev,re,r,rp)
	e:GetLabelObject():DeleteGroup()
end
