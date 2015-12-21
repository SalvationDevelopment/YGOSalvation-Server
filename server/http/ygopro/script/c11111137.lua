--Dark Diviner
function c11111137.initial_effect(c)
	--dark synchro summon
	c:EnableReviveLimit()
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e1:SetRange(LOCATION_EXTRA)
	e1:SetCondition(c11111137.syncon)
	e1:SetOperation(c11111137.synop)
	e1:SetValue(SUMMON_TYPE_SYNCHRO)
	c:RegisterEffect(e1)	
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e2:SetValue(1)
	c:RegisterEffect(e2)
	--deckdes
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(11111137,0))
	e3:SetCategory(CATEGORY_DECKDES)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e3:SetCode(EVENT_ATTACK_ANNOUNCE)
	e3:SetCondition(c11111137.tgcon)
	e3:SetTarget(c11111137.tgtg)
	e3:SetOperation(c11111137.tgop)
	c:RegisterEffect(e3)
end
function c11111137.matfilter1(c,syncard)
	return c:IsSetCard(0x91) and c:IsType(0x400000) and c:IsFaceup() and c:IsCanBeSynchroMaterial(syncard)
end
function c11111137.matfilter2(c,syncard)	
	return c:IsFaceup() and c:IsCanBeSynchroMaterial(syncard) and not c:IsType(TYPE_TUNER) and not c:IsType(0x400000)
end
function c11111137.synfilter1(c,lv,g1,g2)
	local tlv=c:GetLevel()	
	if c:GetFlagEffect(11111131)==0 then	
	return g1:IsExists(c11111137.synfilter3,1,nil,lv+tlv)
	else
	return g1:IsExists(c11111137.synfilter3,1,nil,lv-tlv)
	end	
end
function c11111137.synfilter3(c,lv)
	return c:GetLevel()==lv
end
function c11111137.syncon(e,c,tuner)
	if c==nil then return true end
	local tp=c:GetControler()
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<-1 then return false end
	local g1=Duel.GetMatchingGroup(c11111137.matfilter1,tp,LOCATION_MZONE,LOCATION_MZONE,nil,c)
	local g2=Duel.GetMatchingGroup(c11111137.matfilter2,tp,LOCATION_MZONE,LOCATION_MZONE,nil,c)
	local lv=c:GetLevel()
	return g2:IsExists(c11111137.synfilter1,1,nil,lv,g1,g2)
end
function c11111137.synop(e,tp,eg,ep,ev,re,r,rp,c,tuner)
	local g=Group.CreateGroup()
	local g1=Duel.GetMatchingGroup(c11111137.matfilter1,tp,LOCATION_MZONE,LOCATION_MZONE,nil,c)
	local g2=Duel.GetMatchingGroup(c11111137.matfilter2,tp,LOCATION_MZONE,LOCATION_MZONE,nil,c)
	local lv=c:GetLevel()
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SMATERIAL)
		local m3=g2:FilterSelect(tp,c11111137.synfilter1,1,1,nil,lv,g1,g2)
		local mt1=m3:GetFirst()
		g:AddCard(mt1)
		local lv1=mt1:GetLevel()
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SMATERIAL)
		if mt1:GetFlagEffect(11111131)==0 then	
		local t1=g1:FilterSelect(tp,c11111137.synfilter3,1,1,nil,lv+lv1)
		g:Merge(t1)
		else 
		local t1=g1:FilterSelect(tp,c11111137.synfilter3,1,1,nil,lv-lv1)
		g:Merge(t1)
		end			
	c:SetMaterial(g)
	Duel.SendtoGrave(g,REASON_MATERIAL+REASON_SYNCHRO)
end
function c11111137.tgcon(e,c)
	return Duel.GetAttackTarget():GetAttack()>e:GetHandler():GetBaseAttack()
end
function c11111137.tgtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local ct=math.floor((Duel.GetAttackTarget():GetAttack()-e:GetHandler():GetBaseAttack())/100)	
	Duel.SetOperationInfo(0,CATEGORY_DECKDES,nil,0,1-tp,ct)
end
function c11111137.tgop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetAttackTarget():GetAttack()>e:GetHandler():GetBaseAttack() then
	local ct=math.floor((Duel.GetAttackTarget():GetAttack()-e:GetHandler():GetBaseAttack())/100)	
	Duel.DiscardDeck(1-tp,ct,REASON_EFFECT)
	end
end