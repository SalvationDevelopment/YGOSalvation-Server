--No.16 色の支配者ショック·ルーラー
function c16.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,nil,4,3)
	c:EnableReviveLimit()
	--act limit
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(16,0))
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetCountLimit(1)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCost(c16.cost)
	e1:SetTarget(c16.target)
	e1:SetOperation(c16.operation)
	c:RegisterEffect(e1)
	--Immunities
 	local e2=Effect.CreateEffect(coffee)
 	e2:SetType(EFFECT_TYPE_SINGLE)
 	e2:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
 	e2:SetValue(c11.indes)
 	c:RegisterEffect(e2)
 	local e3=Effect.CreateEffect(coffee)
 	e3:SetType(EFFECT_TYPE_SINGLE)
 	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
 	e3:SetRange(LOCATION_MZONE)
 	e3:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
 	e3:SetValue(c11.indval)
 	c:RegisterEffect(e3)
end
c16.xyz_number=16
function c16.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c16.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.Hint(HINT_SELECTMSG,tp,aux.Stringid(16,1))
	e:SetLabel(Duel.SelectOption(tp,70,71,72))
end
function c16.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetCode(EFFECT_CANNOT_ACTIVATE)
	e1:SetTargetRange(1,1)
	if e:GetLabel()==0 then
		e1:SetValue(c16.aclimit1)
	elseif e:GetLabel()==1 then
		e1:SetValue(c16.aclimit2)
	else e1:SetValue(c16.aclimit3) end
	e1:SetReset(RESET_PHASE+PHASE_END+RESET_OPPO_TURN,1)
	Duel.RegisterEffect(e1,tp)
end
function c16.aclimit1(e,re,tp)
	return re:IsActiveType(TYPE_MONSTER) and not re:GetHandler():IsImmuneToEffect(e)
end
function c16.aclimit2(e,re,tp)
	return re:IsHasType(EFFECT_TYPE_ACTIVATE) and re:IsActiveType(TYPE_SPELL) and not re:GetHandler():IsImmuneToEffect(e)
end
function c16.aclimit3(e,re,tp)
	return re:IsHasType(EFFECT_TYPE_ACTIVATE) and re:IsActiveType(TYPE_TRAP) and not re:GetHandler():IsImmuneToEffect(e)
end

function c16.indes(e,c)
 return not c:IsSetCard(0x48)
end

function c16.indval(e,re)
 if not re then return false end
 local ty=re:GetActiveType()
 return not re:GetOwner():IsSetCard(0x48)
end