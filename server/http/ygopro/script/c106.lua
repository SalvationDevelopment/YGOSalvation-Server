--No.106 巨岩掌ジャイアント・ハンド Giant Hand (CWA)

function c106.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunction(c,4),2)
	c:EnableReviveLimit()
	--negate
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(63746411,0))
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetCode(EVENT_CHAINING)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCondition(c106.condition)
	e1:SetCost(c106.cost)
	e1:SetTarget(c106.target)
	e1:SetOperation(c106.operation)
	c:RegisterEffect(e1)
	--Indestructible except by Number
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e2:SetValue(c106.indes)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
	e3:SetValue(c106.indval)
	c:RegisterEffect(e3)
end
c106.xyz_number=106
function c106.condition(e,tp,eg,ep,ev,re,r,rp)
	return rp~=tp and re:IsActiveType(TYPE_MONSTER)
		and Duel.GetChainInfo(ev,CHAININFO_TRIGGERING_LOCATION)==LOCATION_MZONE
end
function c106.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c106.filter(c)
	return c:IsFaceup() and c:IsType(TYPE_EFFECT)
end
function c106.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(1-tp) and c106.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c106.filter,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	local g=Duel.SelectTarget(tp,c106.filter,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_DISABLE,g,1,0,0)
end
function c106.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if c:IsFaceup() and c:IsRelateToEffect(e) and tc:IsFaceup() and tc:IsRelateToEffect(e) then
		c:SetCardTarget(tc)
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE+EFFECT_FLAG_OWNER_RELATE)
		e1:SetRange(LOCATION_MZONE)
		e1:SetCode(EFFECT_DISABLE)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		e1:SetCondition(c106.rcon)
		tc:RegisterEffect(e1,true)
		local e2=Effect.CreateEffect(c)
		e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
		--e2:SetRange(LOCATION_MZONE)
		--e1:SetReset(RESET_EVENT+0x1fe0000)
		e2:SetCode(EVENT_ATTACK_ANNOUNCE)
		--e2:SetCondition(c106.sdcon)
		e2:SetOperation(c106.tgop)
		tc:RegisterEffect(e2)
		end
end

function c106.sdcon(e)
	local ph=Duel.GetCurrentPhase()
	return (ph==PHASE_DAMAGE)
		and Duel.GetAttacker()==e:GetHandler() and e:GetOwner():IsHasCardTarget(e:GetHandler())
end

function c106.tgop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsFaceup() then
		local dam=c:GetAttack()
		Duel.Damage(tp,dam,REASON_EFFECT)
		Duel.Destroy(c,REASON_EFFECT)
	end
end

function c106.rcon(e)
	return e:GetOwner():IsHasCardTarget(e:GetHandler())
end

function c106.indes(e,c)
	return not c:IsSetCard(0x48)
end

function c106.indval(e,re)
	if not re then return false end
	local ty=re:GetActiveType()
	return not re:GetOwner():IsSetCard(0x48)
end
