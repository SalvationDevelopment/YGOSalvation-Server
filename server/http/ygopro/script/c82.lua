--No.82 ハートランドラコ Heartlanddraco
function c82.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,nil,4,2)
	c:EnableReviveLimit()
	--cannot be battle target
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCode(EFFECT_CANNOT_BE_BATTLE_TARGET)
	e1:SetCondition(c82.atkcon)
	e1:SetValue(1)
	c:RegisterEffect(e1)
	--direct
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(82,0))
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCondition(c82.condition)
	e2:SetCost(c82.cost)
	e2:SetOperation(c82.operation)
	c:RegisterEffect(e2)
	--Number Immunities
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e3:SetValue(c82.indes)
	c:RegisterEffect(e3)
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE)
	e4:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
	e4:SetValue(c82.indval)
	c:RegisterEffect(e4)
end
c82.xyz_number=82
function c82.filter(c)
	return c:IsFaceup() and c:IsType(TYPE_SPELL)
end
function c82.atkcon(e)
	return Duel.IsExistingMatchingCard(c82.filter,e:GetHandlerPlayer(),LOCATION_ONFIELD,0,1,nil)
end
function c82.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetCurrentPhase()==PHASE_MAIN1 and Duel.GetTurnCount()~=1
		and not e:GetHandler():IsHasEffect(EFFECT_DIRECT_ATTACK)
end
function c82.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c82.ftarget(e,c)
	return e:GetLabel()~=c:GetFieldID()
end
function c82.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsFaceup() and c:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_DIRECT_ATTACK)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		c:RegisterEffect(e1)
	end
end

function c82.indes(e,c)
	return not c:IsSetCard(0x48)
end

function c82.indval(e,re)
	if not re then return false end
	local ty=re:GetActiveType()
	return not re:GetOwner():IsSetCard(0x48)
end

