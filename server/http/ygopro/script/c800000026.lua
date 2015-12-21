--Number 54: Lion Heart
function c800000026.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunction(c,1),3)
	c:EnableReviveLimit()
	--indes
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e1:SetCondition(c800000026.indcon)
	e1:SetValue(1)
	c:RegisterEffect(e1)
	--inflict battle damage
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_TRIGGER_F+EFFECT_TYPE_FIELD)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCategory(CATEGORY_DAMAGE)
	e2:SetCode(EVENT_DAMAGE)
	e2:SetCondition(c800000026.dmcon)
	e2:SetOperation(c800000026.dmop)
	c:RegisterEffect(e2)
	--
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_QUICK_O)
	e3:SetProperty(EFFECT_FLAG_DAMAGE_CAL)
	e3:SetCode(EVENT_PRE_DAMAGE_CALCULATE)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCondition(c800000026.dmcon2)
	e3:SetCost(c800000026.cost)
	e3:SetOperation(c800000026.operation)
	c:RegisterEffect(e3)
end
function c800000026.indcon(e)
	return e:GetHandler():IsPosition(POS_FACEUP_ATTACK)
end
function c800000026.dmcon(e,tp,eg,ep,ev,re,r,rp)
	return ep==tp and bit.band(r,REASON_BATTLE)~=0 and (e:GetHandler()==Duel.GetAttacker() or e:GetHandler()==Duel.GetAttackTarget())
end
function c800000026.dmcon2(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetBattleTarget()
end
function c800000026.dmop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Damage(1-tp,ev,REASON_EFFECT)
end
function c800000026.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) and 
	Duel.GetFlagEffect(tp,800000026)==0 
	end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
	Duel.RegisterFlagEffect(tp,800000026,RESET_CHAIN,0,0)
end
function c800000026.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) and c:IsFaceup() then
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e1:SetCode(EFFECT_REFLECT_BATTLE_DAMAGE)
		e1:SetValue(1)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_DAMAGE_CAL)
		c:RegisterEffect(e1)
	end
end