--No.96 ブラック·ミスト
function c96.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,nil,2,3)
	c:EnableReviveLimit()
	--atk u/d
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(96,0))
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetCode(EVENT_ATTACK_ANNOUNCE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCost(c96.atkcost)
	e1:SetTarget(c96.atktg)
	e1:SetOperation(c96.atkop)
	c:RegisterEffect(e1)
	--Immunities
 	local e2=Effect.CreateEffect(coffee)
 	e2:SetType(EFFECT_TYPE_SINGLE)
 	e2:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
 	e2:SetValue(c96.indes)
 	c:RegisterEffect(e2)
 	local e3=Effect.CreateEffect(coffee)
 	e3:SetType(EFFECT_TYPE_SINGLE)
 	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
 	e3:SetRange(LOCATION_MZONE)
 	e3:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
 	e3:SetValue(c96.indval)
 	c:RegisterEffect(e3)
end
c96.xyz_number=96
function c96.atkcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c96.atktg(e,tp,eg,ep,ev,re,r,rp,chk)
	local at=Duel.GetAttackTarget()
	if chk==0 then return ((at and at:IsFaceup() and Duel.GetAttacker()==e:GetHandler()) or at==e:GetHandler())
		and not e:GetHandler():IsStatus(STATUS_CHAINING) end
	Duel.SetTargetCard(e:GetHandler():GetBattleTarget())
end
function c96.atkop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if c:IsRelateToEffect(e) and c:IsFaceup() and tc:IsRelateToEffect(e) and tc:IsFaceup() and not tc:IsImmuneToEffect(e) then
		local atk=tc:GetAttack()/2
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_SET_ATTACK_FINAL)
		e1:SetValue(atk)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		tc:RegisterEffect(e1)
		local e2=Effect.CreateEffect(c)
		e2:SetType(EFFECT_TYPE_SINGLE)
		e2:SetProperty(EFFECT_FLAG_SINGLE_RANGE+EFFECT_FLAG_CANNOT_DISABLE)
		e2:SetRange(LOCATION_MZONE)
		e2:SetCode(EFFECT_UPDATE_ATTACK)
		e2:SetValue(atk)
		e2:SetReset(RESET_EVENT+0x1fe0000)
		c:RegisterEffect(e2)
	end
end

function c96.indes(e,c)
 return not c:IsSetCard(0x48)
end

function c96.indval(e,re)
 if not re then return false end
 local ty=re:GetActiveType()
 return not re:GetOwner():IsSetCard(0x48)
end