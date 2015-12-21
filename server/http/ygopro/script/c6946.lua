--Scripted by Eerie Code
--Credit to Michael Lawrence Dee for the multiple attacks script
--Moonlight Cat Dancer
function c6946.initial_effect(c)
	--fusion material
	aux.AddFusionProcFunRep(c,c6946.matfil,2,true)
	c:EnableReviveLimit()
	--battle indestructable
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e1:SetValue(1)
	c:RegisterEffect(e1)
	--Multiple attacks
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(6946,0))
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCountLimit(1)
	e2:SetCondition(c6946.condition)
	e2:SetCost(c6946.cost)
	e2:SetOperation(c6946.operation)
	c:RegisterEffect(e2)
	--atk
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(6946,1))
	e3:SetCategory(CATEGORY_DAMAGE)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e3:SetCode(EVENT_ATTACK_ANNOUNCE)
	e3:SetTarget(c6946.damtg)
	e3:SetOperation(c6946.damop)
	c:RegisterEffect(e3)
end

function c6946.matfil(c)
 return c:IsSetCard(0xe1) or c:IsSetCard(0x209)
end

function c6946.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetCurrentPhase()==PHASE_MAIN1
end
function c6946.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckReleaseGroup(tp,c6946.matfil,1,e:GetHandler()) end
	local g=Duel.SelectReleaseGroup(tp,c6946.matfil,1,1,e:GetHandler())
	Duel.Release(g,REASON_COST)
end
function c6946.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) then
		local e0=Effect.CreateEffect(c)
		e0:SetType(EFFECT_TYPE_SINGLE)
		e0:SetCode(EFFECT_EXTRA_ATTACK)
		e0:SetValue(9999)
		e0:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e0:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
		c:RegisterEffect(e0)
		local e2=Effect.CreateEffect(c)
		e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
		e2:SetCode(EVENT_DAMAGE_STEP_END)
		e2:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e2:SetOperation(c6946.unop)
		e2:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
		c:RegisterEffect(e2)
		local e3=Effect.CreateEffect(c)
		e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		e3:SetRange(LOCATION_MZONE)
		e3:SetCode(EVENT_DAMAGE_CALCULATING)
		e3:SetCondition(c6946.indescon)
		e3:SetOperation(c6946.indesop)
		e3:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
		c:RegisterEffect(e3)
		local e4=Effect.CreateEffect(c)
		e4:SetType(EFFECT_TYPE_FIELD)
		e4:SetRange(LOCATION_MZONE)
		e4:SetTargetRange(0,LOCATION_MZONE)
		e4:SetProperty(EFFECT_FLAG_IGNORE_IMMUNE+EFFECT_FLAG_CANNOT_DISABLE)
		e4:SetCode(EFFECT_CANNOT_BE_BATTLE_TARGET)
		e4:SetTarget(c6946.valtg)
		e4:SetValue(c6946.vala)
		e4:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
		c:RegisterEffect(e4)
	end
end
function c6946.unop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local bc=c:GetBattleTarget()
	if c:GetFlagEffect(6948)==0 then
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetProperty(EFFECT_FLAG_IGNORE_IMMUNE+EFFECT_FLAG_CANNOT_DISABLE)
		e1:SetCode(EFFECT_CANNOT_DIRECT_ATTACK)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_BATTLE)
		c:RegisterEffect(e1)
		c:RegisterFlagEffect(6948,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_BATTLE,0,1)
	end
	if bc then
		if bc:GetFlagEffect(6946)>0 then
			bc:RegisterFlagEffect(6947,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_BATTLE,0,1)
		else
			bc:RegisterFlagEffect(6946,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_BATTLE,0,1)
		end
	end
end
function c6946.valtg(e,c)
	return c:GetFlagEffect(6947)>0
end
function c6946.vala(e,c)
	return c==e:GetHandler()
end
function c6946.indescon(e,tp,eg,ep,ev,re,r,rp)
	local bc=e:GetHandler():GetBattleTarget()
	return bc and bc:GetFlagEffect(6946)==0
end
function c6946.indesop(e,tp,eg,ep,ev,re,r,rp)
	local bc=e:GetHandler():GetBattleTarget()
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e1:SetValue(1)
	e1:SetReset(RESET_PHASE+PHASE_DAMAGE_CAL)
	bc:RegisterEffect(e1,true)
end

function c6946.damtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetTargetPlayer(1-tp)
	Duel.SetTargetParam(100)
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,1-tp,100)
end
function c6946.damop(e,tp,eg,ep,ev,re,r,rp)
	local p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	Duel.Damage(p,d,REASON_EFFECT)
end