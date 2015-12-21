--Number 14: Greedy Sarameya (RP)
function c14.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,nil,5,2)
	c:EnableReviveLimit()
	--reflect damage
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_REFLECT_DAMAGE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetTargetRange(1,0)
	e1:SetValue(c14.refcon)
	c:RegisterEffect(e1)
	--destroy
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_DESTROY)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_BATTLE_DESTROYING)
	e2:SetCondition(aux.bdogcon)
	e2:SetCost(c14.descost)
	e2:SetTarget(c14.destg)
	e2:SetOperation(c14.desop)
	c:RegisterEffect(e2)
	--Immunities
 	local e3=Effect.CreateEffect(c)
 	e3:SetType(EFFECT_TYPE_SINGLE)
 	e3:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
 	e3:SetValue(c14.indes)
 	c:RegisterEffect(e3)
 	local e4=Effect.CreateEffect(c)
 	e4:SetType(EFFECT_TYPE_SINGLE)
 	e4:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
 	e4:SetRange(LOCATION_MZONE)
 	e4:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
 	e4:SetValue(c14.indval)
 	c:RegisterEffect(e4)
end
c14.xyz_number=14
function c14.refcon(e,re,val,r,rp,rc)
	return bit.band(r,REASON_EFFECT)~=0 and rp~=e:GetHandlerPlayer()
end
function c14.descost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c14.filter(c,atk)
	return c:IsFaceup() and c:IsAttackBelow(atk) and c:IsDestructable()
end
function c14.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	local atk=e:GetHandler():GetBattleTarget():GetBaseAttack()
	if chk==0 then return Duel.IsExistingMatchingCard(c14.filter,tp,0,LOCATION_MZONE,1,nil,atk) end
	local g=Duel.GetMatchingGroup(c14.filter,tp,0,LOCATION_MZONE,nil,atk)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
end
function c14.desop(e,tp,eg,ep,ev,re,r,rp)
	local atk=e:GetHandler():GetBattleTarget():GetBaseAttack()
	local g=Duel.GetMatchingGroup(c14.filter,tp,0,LOCATION_MZONE,nil,atk)
	Duel.Destroy(g,REASON_EFFECT)
end
function c14.indes(e,c)
 return not c:IsSetCard(0x48)
end

function c14.indval(e,re)
 if not re then return false end
 local ty=re:GetActiveType()
 return not re:GetOwner():IsSetCard(0x48)
end