-- Number 9: Canopy Star- Dyson Sphere
function c9.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,nil,9,2)
	c:EnableReviveLimit()
	--negate attack
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(9,0))
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetRange(LOCATION_MZONE)
	e1:SetHintTiming(0,TIMING_BATTLE_PHASE)
	e1:SetCondition(c9.atkcon)
	e1:SetCost(c9.atkcost)
	e1:SetOperation(c9.atkop)
	c:RegisterEffect(e1)
	--material
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(9,1))
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_BE_BATTLE_TARGET)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetCondition(c9.olcon)
	e2:SetTarget(c9.oltg)
	e2:SetOperation(c9.olop)
	c:RegisterEffect(e2)
	--direct attack
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(9,0))
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCountLimit(1)
	e3:SetCondition(c9.dacon)
	e3:SetCost(c9.dacost)
	e3:SetOperation(c9.daop)
	c:RegisterEffect(e3)
	--Indestructable
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE)
	e4:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e4:SetValue(c9.indes)
	c:RegisterEffect(e4)
	local e5=Effect.CreateEffect(c)
	e5:SetType(EFFECT_TYPE_SINGLE)
	e5:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e5:SetRange(LOCATION_MZONE)
	e5:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
	e5:SetValue(c9.indval)
	c:RegisterEffect(e5)
end
function c9.atkcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler()==Duel.GetAttackTarget() and e:GetHandler():GetOverlayCount()~=0
end
function c9.atkcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():GetFlagEffect(9)==0 end
	e:GetHandler():RegisterFlagEffect(9,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_DAMAGE,0,1)
end
function c9.atkop(e,tp,eg,ep,ev,re,r,rp)
	Duel.NegateAttack()
end
function c9.olcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetOverlayCount()==0 and e:GetHandler():IsType(TYPE_XYZ)
end
function c9.oltg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and chkc:IsType(TYPE_MONSTER) end
	if chk==0 then return Duel.IsExistingTarget(Card.IsType,tp,LOCATION_GRAVE,0,2,nil,TYPE_MONSTER) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	local g=Duel.SelectTarget(tp,Card.IsType,tp,LOCATION_GRAVE,0,2,2,nil,TYPE_MONSTER)
	Duel.SetOperationInfo(0,CATEGORY_LEAVE_GRAVE,g,2,0,0)
end
function c9.olop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) then
		local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS):Filter(Card.IsRelateToEffect,nil,e)
		if g:GetCount()>0 then
			Duel.Overlay(c,g)
		end
	end
end
function c9.dafilter(c,atk)
	return c:IsFaceup() and c:GetAttack()>atk
end
function c9.dacon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetCurrentPhase()==PHASE_MAIN1
		and Duel.IsExistingMatchingCard(c9.dafilter,tp,0,LOCATION_MZONE,1,nil,e:GetHandler():GetAttack())
end
function c9.dacost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c9.daop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsFaceup() and c:IsRelateToEffect(e)
		and Duel.IsExistingMatchingCard(c9.dafilter,tp,0,LOCATION_MZONE,1,nil,c:GetAttack()) then
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e1:SetCode(EFFECT_DIRECT_ATTACK)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		c:RegisterEffect(e1)
	end
end

function c9.indes(e,c)
	return not c:IsSetCard(0x48)
end

function c9.indval(e,re)
	if not re then return false end
	local ty=re:GetActiveType()
	return not re:GetOwner():IsSetCard(0x48)
end